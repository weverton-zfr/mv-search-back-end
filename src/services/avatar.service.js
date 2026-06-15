import { supabase } from "../config/supabase.js";

const AVATAR_BUCKET = "avatars";
const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function getExtensionFromMime(mimeType) {
  const extensions = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif"
  };

  return extensions[mimeType] || "jpg";
}

function parseBase64Image(avatarBase64, fallbackType) {
  if (!avatarBase64) return null;

  const value = avatarBase64.toString();
  const match = value.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);

  const mimeType = match?.[1] || fallbackType;
  const base64 = match?.[2] || value;

  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new Error("Formato de imagem inválido. Use JPG, PNG, WEBP ou GIF.");
  }

  const buffer = Buffer.from(base64, "base64");

  if (!buffer.length) {
    throw new Error("Imagem inválida.");
  }

  if (buffer.length > MAX_AVATAR_SIZE) {
    throw new Error("A imagem deve ter no máximo 2MB.");
  }

  return {
    buffer,
    mimeType,
    extension: getExtensionFromMime(mimeType)
  };
}

export async function uploadAvatar({ userId, avatarBase64, avatarType }) {
  const image = parseBase64Image(avatarBase64, avatarType);

  if (!image) return null;

  const filePath = `${userId}/avatar-${Date.now()}.${image.extension}`;

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(filePath, image.buffer, {
      contentType: image.mimeType,
      upsert: true
    });

  if (uploadError) {
    throw new Error(uploadError.message || "Erro ao salvar foto de perfil.");
  }

  const { data } = supabase.storage
    .from(AVATAR_BUCKET)
    .getPublicUrl(filePath);

  return data.publicUrl;
}
