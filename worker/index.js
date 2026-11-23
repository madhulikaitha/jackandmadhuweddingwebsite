const MAX_BYTES = 8_000_000;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-admin-key",
  "Access-Control-Max-Age": "86400",
};

function withCors(response) {
  const headers = new Headers(response.headers);
  Object.entries(corsHeaders).forEach(([key, value]) => headers.set(key, value));
  return new Response(response.body, { status: response.status, headers });
}

function json(body, status = 200) {
  return withCors(
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    })
  );
}

function keysMatch(given, expected) {
  if (!given || !expected || given.length !== expected.length) return false;
  let difference = 0;
  for (let index = 0; index < given.length; index += 1) {
    difference |= given.charCodeAt(index) ^ expected.charCodeAt(index);
  }
  return difference === 0;
}

function imageType(bytes, claimed) {
  const header = new Uint8Array(bytes.slice(0, 12));
  const jpeg = header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff;
  const png = header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4e && header[3] === 0x47;
  const webp =
    header[0] === 0x52 &&
    header[1] === 0x49 &&
    header[2] === 0x46 &&
    header[3] === 0x46 &&
    header[8] === 0x57 &&
    header[9] === 0x45 &&
    header[10] === 0x42 &&
    header[11] === 0x50;
  if (jpeg) return "image/jpeg";
  if (png) return "image/png";
  if (webp) return "image/webp";
  if (claimed.startsWith("image/jpeg") || claimed.startsWith("image/png") || claimed.startsWith("image/webp")) {
    return "";
  }
  return "";
}

function photoId(key) {
  return key.replace(/\.(jpg|png|webp)$/i, "");
}

async function findPhoto(bucket, id) {
  for (const extension of ["jpg", "png", "webp"]) {
    const object = await bucket.get(`${id}.${extension}`);
    if (object) return { object, key: `${id}.${extension}` };
  }
  return null;
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return withCors(new Response(null, { status: 204 }));

    const url = new URL(request.url);
    const photoMatch = url.pathname.match(/^\/api\/photos\/([A-Za-z0-9-]+)$/);

    if (url.pathname === "/api/photos" && request.method === "GET") {
      const listed = await env.PHOTOS.list({ limit: 1000 });
      const photos = listed.objects
        .map((object) => ({
          id: photoId(object.key),
          created: object.uploaded.toISOString(),
        }))
        .sort((first, second) => second.created.localeCompare(first.created));
      return json({ photos });
    }

    if (url.pathname === "/api/unlock" && request.method === "POST") {
      const allowed = keysMatch(request.headers.get("x-admin-key"), env.ADMIN_KEY);
      return json(allowed ? { ok: true } : { error: "Unauthorized" }, allowed ? 200 : 401);
    }

    if (url.pathname === "/api/photos" && request.method === "POST") {
      const claimed = request.headers.get("content-type") || "";
      const bytes = await request.arrayBuffer();
      if (bytes.byteLength < 32 || bytes.byteLength > MAX_BYTES) {
        return json({ error: "That photo could not be added." }, 400);
      }
      const type = imageType(bytes, claimed);
      if (!type) return json({ error: "Please choose a JPEG, PNG, or WebP photo." }, 400);
      const extension = type === "image/png" ? "png" : type === "image/webp" ? "webp" : "jpg";
      const id = crypto.randomUUID();
      await env.PHOTOS.put(`${id}.${extension}`, bytes, {
        httpMetadata: { contentType: type },
        customMetadata: { created: new Date().toISOString() },
      });
      return json({ id }, 201);
    }

    if (photoMatch && request.method === "GET") {
      const found = await findPhoto(env.PHOTOS, photoMatch[1]);
      if (!found) return json({ error: "Not found" }, 404);
      return withCors(
        new Response(found.object.body, {
          headers: {
            "Content-Type": found.object.httpMetadata?.contentType || "image/jpeg",
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        })
      );
    }

    if (photoMatch && request.method === "DELETE") {
      if (!keysMatch(request.headers.get("x-admin-key"), env.ADMIN_KEY)) {
        return json({ error: "Unauthorized" }, 401);
      }
      await Promise.all(["jpg", "png", "webp"].map((extension) => env.PHOTOS.delete(`${photoMatch[1]}.${extension}`)));
      return json({ ok: true });
    }

    return json({ error: "Not found" }, 404);
  },
};
