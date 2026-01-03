import React, { useState, useEffect } from "react";
import { X, Phone, Mail, Download, Copy, Check } from "lucide-react";

const ShareModal = ({ card, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    if (card) {
      // Use custom link if available, otherwise use ID
      const slug = card.cardLink || card.cardId;
      // Construct full URL dynamically based on current domain
      const url = `${window.location.origin}/p/${slug}`;
      setShareUrl(url);
    }
  }, [card]);

  if (!card) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = async () => {
    try {
      const response = await fetch(
        `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(
          shareUrl
        )}`
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `qr-${card.fullName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading QR:", error);
      alert(
        "Could not download image. Try right-clicking the QR code to save it."
      );
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop with semi-transparent black */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-semibold text-gray-800">Share Card</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-8 flex flex-col items-center">
          {/* QR Code Section */}
          <div className="bg-white p-4 rounded-xl border-2 border-gray-100 shadow-sm mb-6 relative group">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                shareUrl
              )}`}
              alt="QR Code"
              className="w-48 h-48 object-contain"
            />
            <div
              onClick={handleDownloadQR}
              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer rounded-lg"
            >
              <Download size={24} />
            </div>
          </div>

          <h4 className="font-bold text-xl text-gray-900 mb-1">
            {card.fullName}
          </h4>
          <p className="text-gray-500 text-sm mb-6 text-center max-w-[80%]">
            Scan to view card
          </p>

          {/* Copy Link Section */}
          <div className="w-full flex items-center gap-2 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-500 truncate flex-1 font-mono">
              {shareUrl}
            </div>
            <button
              onClick={handleCopyLink}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          {/* Share Actions Grid */}
          <div className="grid grid-cols-3 gap-4 w-full border-t border-gray-100 pt-6">
            <a
              href={`https://wa.me/?text=Check out my digital card: ${encodeURIComponent(
                shareUrl
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center group-hover:bg-green-100 transition-colors shadow-sm">
                <Phone size={20} />
              </div>
              <span className="text-xs font-medium text-gray-600">
                WhatsApp
              </span>
            </a>

            <a
              href={`mailto:?subject=My Digital Card&body=Here is my digital business card: ${shareUrl}`}
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors shadow-sm">
                <Mail size={20} />
              </div>
              <span className="text-xs font-medium text-gray-600">Email</span>
            </a>

            <button
              onClick={handleDownloadQR}
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-12 h-12 bg-gray-100 text-gray-700 rounded-full flex items-center justify-center group-hover:bg-gray-200 transition-colors shadow-sm">
                <Download size={20} />
              </div>
              <span className="text-xs font-medium text-gray-600">Save QR</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
