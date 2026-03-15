"use client";

import { useState } from "react";
import { TASK_FORM_DEFAULTS } from "@/constants";
import type { TaskFormState } from "@/types";

interface TaskFormProps {
  form: TaskFormState;
  onChange: (form: TaskFormState) => void;
}

export function TaskForm({ form, onChange }: TaskFormProps) {
  function set(patch: Partial<TaskFormState>) {
    onChange({ ...form, ...patch });
  }

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    set({ imageFile: file, imagePreview: URL.createObjectURL(file) });
  }

  function handleOption(idx: number, value: string) {
    const opts = [...form.options];
    opts[idx] = value;
    set({ options: opts });
  }

  function addOption() {
    if (form.options.length >= TASK_FORM_DEFAULTS.maxOptions) return;
    set({ options: [...form.options, ""] });
  }

  function removeOption(idx: number) {
    if (form.options.length <= TASK_FORM_DEFAULTS.minOptions) return;
    set({ options: form.options.filter((_, i) => i !== idx) });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Content type toggle */}
      <div>
        <label className="label text-[#888888] font-bold text-[11px] mb-1.5">CONTENT TYPE</label>
        <div className="flex gap-3">
          {(["image", "text"] as const).map((t) => (
            <button
              key={t}
              onClick={() => set({ contentType: t })}
              className={`px-4 py-1.5 flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                form.contentType === t
                  ? "bg-[#a855f7] hover:bg-[#9333ea] text-white"
                  : "border border-white/5 bg-transparent text-[#888888] hover:border-white/10"
              }`}
            >
              {t === "image" ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                  Image
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
                  Text
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Dataset upload */}
      {form.contentType === "image" ? (
        <div>
          <label className="label text-[#888888] font-bold text-[11px] mb-1.5 mt-1.5">UPLOAD IMAGE</label>
          <label className="flex flex-col items-center justify-center h-24 border-[1.5px] border-dashed border-[#333333] rounded-xl cursor-pointer hover:border-[#4a478a] transition-colors bg-[#0f0f0f]">
            {form.imagePreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.imagePreview}
                alt="preview"
                className="h-full w-full object-contain rounded-xl"
              />
            ) : (
              <span className="text-[#555555] font-medium text-sm">Click to upload image</span>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImage}
            />
          </label>
        </div>
      ) : (
        <div>
          <label className="label text-[#888888] font-bold text-[11px] mb-1.5 mt-1.5">TEXT CONTENT</label>
          <textarea
            className="input-field h-16 py-2 px-3 resize-none bg-[#0f0f0f] border-[#333333]"
            placeholder="Paste the text to label…"
            value={form.contentText}
            onChange={(e) => set({ contentText: e.target.value })}
          />
        </div>
      )}

      {/* Question */}
      <div>
        <label className="label text-[#888888] font-bold text-[11px] mb-1.5 mt-1.5">QUESTION</label>
        <input
          className="input-field bg-[#0f0f0f] border-[#1a1a1a] text-sm py-2 px-3"
          placeholder="e.g. Is this image a cat or a dog?"
          value={form.question}
          onChange={(e) => set({ question: e.target.value })}
        />
      </div>

      {/* Answer options */}
      <div>
        <label className="label text-[#888888] font-bold text-[11px] mb-1.5 mt-1.5">ANSWER OPTIONS</label>
        <div className="flex flex-col gap-2">
          {form.options.map((opt, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <input
                className="input-field bg-[#0f0f0f] border-[#1a1a1a] text-sm py-2 px-3"
                placeholder={`Option ${idx + 1}`}
                value={opt}
                onChange={(e) => handleOption(idx, e.target.value)}
              />
              {form.options.length > TASK_FORM_DEFAULTS.minOptions && (
                <button
                  onClick={() => removeOption(idx)}
                  className="text-red-400 hover:text-red-300 text-sm px-2 py-1"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          {form.options.length < TASK_FORM_DEFAULTS.maxOptions && (
            <button
              onClick={addOption}
              className="text-[#4a478a] hover:text-[#5c58a6] text-[11px] font-semibold py-0.5 text-left"
            >
              + Add Option
            </button>
          )}
        </div>
      </div>

      {/* Workers / Reward / Deadline */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="label text-[#888888] font-bold text-[11px] mb-1.5 mt-1.5">WORKERS</label>
          <input
            type="number"
            min="3"
            className="input-field bg-[#0f0f0f] border-[#1a1a1a] text-sm py-2 px-3"
            value={form.workers}
            onChange={(e) => set({ workers: e.target.value })}
          />
        </div>
        <div>
          <label className="label text-[#888888] font-bold text-[11px] mb-1.5 mt-1.5">REWARD (ETH)</label>
          <input
            type="number"
            step="0.0001"
            min="0.0001"
            className="input-field bg-[#0f0f0f] border-[#1a1a1a] text-sm py-2 px-3"
            value={form.reward}
            onChange={(e) => set({ reward: e.target.value })}
          />
        </div>
        <div>
          <label className="label text-[#888888] font-bold text-[11px] mb-1.5 mt-1.5">DEADLINE (HOURS)</label>
          <input
            type="number"
            min="1"
            className="input-field bg-[#0f0f0f] border-[#1a1a1a] text-sm py-2 px-3"
            value={form.hours}
            onChange={(e) => set({ hours: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
