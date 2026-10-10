"use client";

import * as React from "react";
import { ImagePlus, UserRound, X, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/context/auth-context";
import { isApiError, profileService } from "@/lib/api";
import { uploadProfileImage } from "@/lib/cloudinary";
import { useToast } from "@/components/ui/toast";

const CROP_SIZE = 288;

function CropModal({
  source,
  onCancel,
  onCrop,
}: {
  source: string;
  onCancel: () => void;
  onCrop: (file: File, previewUrl: string) => void;
}) {
  const imageRef = React.useRef<HTMLImageElement>(null);
  const [imageSize, setImageSize] = React.useState({ width: 0, height: 0 });
  const [zoom, setZoom] = React.useState(1);
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });
  const dragStart = React.useRef<{ x: number; y: number; offsetX: number; offsetY: number } | null>(null);

  function handleImageLoad() {
    const image = imageRef.current;
    if (!image) return;
    const scale = Math.max(CROP_SIZE / image.naturalWidth, CROP_SIZE / image.naturalHeight);
    setImageSize({ width: image.naturalWidth * scale, height: image.naturalHeight * scale });
    setOffset({ x: 0, y: 0 });
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStart.current = { x: event.clientX, y: event.clientY, offsetX: offset.x, offsetY: offset.y };
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const start = dragStart.current;
    if (!start) return;
    setOffset({ x: start.offsetX + event.clientX - start.x, y: start.offsetY + event.clientY - start.y });
  }

  function finishDrag() {
    dragStart.current = null;
  }

  function cropImage() {
    const image = imageRef.current;
    if (!image || !imageSize.width) return;

    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 600;
    const context = canvas.getContext("2d");
    if (!context) return;

    const scale = imageSize.width / image.naturalWidth;
    const renderedWidth = imageSize.width * zoom;
    const renderedHeight = imageSize.height * zoom;
    const left = (CROP_SIZE - renderedWidth) / 2 + offset.x;
    const top = (CROP_SIZE - renderedHeight) / 2 + offset.y;
    const sourceX = Math.max(0, -left / scale / zoom);
    const sourceY = Math.max(0, -top / scale / zoom);
    const sourceSize = Math.min(
      image.naturalWidth - sourceX,
      image.naturalHeight - sourceY,
      CROP_SIZE / scale / zoom
    );

    context.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, 600, 600);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], "profile-picture.jpg", { type: "image/jpeg" });
      onCrop(file, URL.createObjectURL(blob));
    }, "image/jpeg", 0.9);
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-label="Crop profile picture">
      <div className="w-full max-w-md rounded-xl bg-background-secondary p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Crop profile picture</h2>
            <p className="text-sm text-foreground-muted">Drag the image and adjust the zoom.</p>
          </div>
          <button type="button" onClick={onCancel} className="rounded-md p-1 text-foreground-muted hover:bg-divider hover:text-foreground" aria-label="Close crop dialog">
            <X size={18} />
          </button>
        </div>
        <div
          className="relative mx-auto h-72 w-72 cursor-grab touch-none overflow-hidden rounded-full bg-divider active:cursor-grabbing"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishDrag}
          onPointerCancel={finishDrag}
        >
          <img
            ref={imageRef}
            src={source}
            alt="Crop preview"
            onLoad={handleImageLoad}
            draggable={false}
            className="pointer-events-none absolute max-w-none"
            style={{
              width: imageSize.width ? imageSize.width * zoom : "auto",
              height: imageSize.height ? imageSize.height * zoom : "auto",
              transform: `translate(calc((288px - ${imageSize.width * zoom}px) / 2 + ${offset.x}px), calc((288px - ${imageSize.height * zoom}px) / 2 + ${offset.y}px))`,
            }}
          />
        </div>
        <div className="mt-5 flex items-center gap-3">
          <ZoomOut size={16} className="text-foreground-muted" />
          <input aria-label="Image zoom" type="range" min="1" max="3" step="0.05" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} className="flex-1 accent-primary" />
          <ZoomIn size={16} className="text-foreground-muted" />
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="button" onClick={cropImage} disabled={!imageSize.width}>Use this picture</Button>
        </div>
      </div>
    </div>
  );
}

function ImageViewer({ source, onClose }: { source: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-label="View profile picture" onClick={onClose}>
      <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(event) => event.stopPropagation()}>
        <img
          src={source}
          alt="Profile picture"
          referrerPolicy="no-referrer"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = "/placeholder-user.jpg";
          }}
          className="max-h-[85vh] max-w-[85vw] rounded-lg object-contain shadow-2xl"
        />
        <button type="button" onClick={onClose} className="absolute -right-3 -top-3 rounded-full bg-background-secondary p-2 text-foreground shadow" aria-label="Close image viewer">
          <X size={18} />
        </button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { user, setUser } = useAuth();
  const { success, error: toastError } = useToast();
  const [source, setSource] = React.useState("");
  const [preview, setPreview] = React.useState("");
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [viewingImage, setViewingImage] = React.useState("");

  React.useEffect(() => {
    return () => {
      [source, preview].forEach((url) => { if (url) URL.revokeObjectURL(url); });
    };
  }, [source, preview]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (source) URL.revokeObjectURL(source);
    setSource(URL.createObjectURL(file));
  }

  function handleCrop(file: File, croppedPreview: string) {
    if (source) URL.revokeObjectURL(source);
    if (preview) URL.revokeObjectURL(preview);
    setSource("");
    setSelectedFile(file);
    setPreview(croppedPreview);
  }

  async function handleUpload() {
    if (!selectedFile || !user) return;
    setLoading(true);
    try {
      const profileImageUrl = await uploadProfileImage(selectedFile);
      const updatedUser = await profileService.updateImage(profileImageUrl);
      setUser({ ...user, ...(updatedUser ?? {}), profileImageUrl });
      setSelectedFile(null);
      if (preview) URL.revokeObjectURL(preview);
      setPreview("");
      success("Profile picture updated.");
    } catch (err) {
      toastError(isApiError(err) ? err.message : err instanceof Error ? err.message : "Could not update your profile picture.");
    } finally {
      setLoading(false);
    }
  }

  const displayedImage = preview || user?.profileImageUrl;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Profile</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-foreground-muted">Manage your account and profile picture.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Profile picture</CardTitle>
          <CardDescription>Choose an image to use across Money Manager.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <button type="button" onClick={() => displayedImage && setViewingImage(displayedImage)} className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label="View profile picture">
            <Avatar name={user?.fullName || user?.email || "U"} src={displayedImage} size="xl" />
          </button>
          <div className="flex flex-1 flex-col gap-3">
            <label htmlFor="settings-profile-image" className="text-sm font-medium text-foreground">Change profile picture</label>
            <input id="settings-profile-image" type="file" accept="image/*" onChange={handleFileChange} className="w-full rounded-md border border-border bg-input-bg px-3 py-2 text-sm" />
            <Button type="button" onClick={handleUpload} loading={loading} disabled={!selectedFile} className="w-fit">
              <ImagePlus size={16} /> Upload picture
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center gap-3 pt-6">
          <UserRound size={18} className="text-primary" />
          <div><p className="text-sm font-semibold text-foreground">{user?.fullName}</p><p className="text-sm text-foreground-muted">{user?.email}</p></div>
        </CardContent>
      </Card>
      {source && <CropModal source={source} onCancel={() => { URL.revokeObjectURL(source); setSource(""); }} onCrop={handleCrop} />}
      {viewingImage && <ImageViewer source={viewingImage} onClose={() => setViewingImage("")} />}
    </div>
  );
}
