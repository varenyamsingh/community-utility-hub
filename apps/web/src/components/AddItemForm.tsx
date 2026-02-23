"use client";

import { useState } from "react";

export default function AddItemForm() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const userId = localStorage.getItem("user_id");
    const token = localStorage.getItem("supabase_token");

    if (!userId) {
      alert("Please log in to list an item");
      setLoading(false);
      return;
    }

    const priceValue = parseFloat(formData.get("price") as string);
    
    // Validate price is 0 or greater
    if (isNaN(priceValue) || priceValue < 0) {
      alert("Price must be 0 or greater");
      setLoading(false);
      return;
    }

    const itemData = {
      title: formData.get("title"),
      description: formData.get("description"),
      price: priceValue,
      ownerId: userId,
    };

    // 1. Get current GPS location
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;

      try {
        // 2. Send to NestJS Backend
        const res = await fetch("http://localhost:3001/items", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ ...itemData, lat: latitude, lng: longitude }),
        });

        if (res.ok) {
          alert("Item added successfully!");
          window.location.reload(); // Refresh to see the new marker on map
        } else {
          const error = await res.json();
          alert(error.message || "Failed to add item");
        }
      } catch (err) {
        console.error("Error adding item:", err);
        alert("Failed to add item. Please try again.");
      } finally {
        setLoading(false);
      }
    }, (_err) => {
      alert("Could not get location. Please enable GPS.");
      setLoading(false);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Lend a Tool</h2>
          <p className="text-xs text-gray-400">Share your tools with neighbors</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Item Name</label>
        <input 
          name="title" 
          placeholder="e.g., Power Drill, Lawn Mower" 
          className="input-field" 
          required 
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
        <textarea 
          name="description" 
          placeholder="Describe your tool's condition and features..." 
          className="input-field min-h-[100px] resize-none"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Price per Day</label>
        <div className="flex items-center bg-gray-900/60 border border-indigo-500/20 rounded-xl overflow-hidden">
          <span className="px-3 py-3 text-gray-400 font-medium bg-gray-800/50">$</span>
          <input 
            name="price" 
            type="number" 
            placeholder="0.00" 
            className="input-field border-0 rounded-none bg-transparent focus:ring-0" 
            min="0" 
            step="0.01"
            required 
          />
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-500 bg-white/5 p-3 rounded-lg">
        <svg className="w-4 h-4 text-cyan-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Your location will be automatically detected</span>
      </div>

      <button 
        type="submit" 
        disabled={loading} 
        className="w-full btn-primary flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span>Listing Item...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>List Item</span>
          </>
        )}
      </button>
    </form>
  );
}
