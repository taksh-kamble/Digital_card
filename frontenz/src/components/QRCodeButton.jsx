"use client";
import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { QrCode, Download, X, Share2 } from "lucide-react";

export const QRCodeButton = ({ cardId, fullName }) => {
  const [isOpen, setIsOpen] = useState(false);
  // Construct the public URL (Replace with your actual production domain)
  const publicUrl = `${window.location.origin}/v/${cardId}`;

  const downloadQR = () => {
    const svg = document.getElementById("qr-code-svg");
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `${fullName}-QR.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-3 bg-slate-50 text-slate-600 rounded-xl hover:text-blue-600 hover:bg-blue-50 transition-colors"
        title="Show QR Code"
      >
        <QrCode size={20} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl relative animate-in zoom-in-95 duration-200 text-center">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"
            >
              <X size={24} />
            </button>

            <div className="mb-6 mt-4">
              <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600">
                <Share2 size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Share Card</h3>
              <p className="text-slate-500 text-sm">
                Scan to view {fullName}'s profile
              </p>
            </div>

            <div className="bg-white p-4 rounded-3xl border-4 border-slate-50 inline-block shadow-inner mb-8">
              <QRCodeSVG
                id="qr-code-svg"
                value={publicUrl}
                size={200}
                level={"H"}
                includeMargin={true}
              />
            </div>

            <button
              onClick={downloadQR}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-600 transition-all shadow-lg"
            >
              <Download size={20} /> Download Image
            </button>
          </div>
        </div>
      )}
    </>
  );
};
