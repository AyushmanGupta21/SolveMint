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
    <div className="flex flex-col gap-6">
      {/* Content type toggle */}
      <div>
        <label className="label">Content Type</label>
        <div className="flex gap-3">
          {(["image", "text"] as const).map((t) => (
            <button
              key={t}
              onClick={() => set({ contentType: t })}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all duration-150 ${
                form.contentType === t
                  ? "border-brand-500 bg-brand-500/20 text-brand-300"
                  : "border-white/10 text-slate-400 hover:border-white/20"
              }`}
            >
              {t === "image" ? "🖼  Image" : "📝  Text"}
            </button>
          ))}
        </div>
      </div>

      {/* Dataset upload */}
      {form.contentType === "image" ? (
        <div>
          <label className="label">Upload Image</label>
          <label className="flex flex-col items-center justify-center h-36 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-brand-500/50 transition-colors bg-white/[0.02]">
            {form.imagePreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.imagePreview}
                alt="preview"
                className="h-full w-full object-contain rounded-xl"
              />
            ) : (
              <span className="text-slate-500 text-sm">Click to upload image</span>
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
          <label className="label">Text Content</label>
          <textarea
            className="input-field h-24 resize-none"
            placeholder="Paste the text to label…"
            value={form.contentText}
            onChange={(e) => set({ contentText: e.target.value })}
          />
        </div>
      )}

      {/* Question */}
      <div>
        <label className="label">Question</label>
        <input
          className="input-field"
          placeholder="e.g. Is this image a cat or a dog?"
          value={form.question}
          onChange={(e) => set({ question: e.target.value })}
        />
      </div>

      {/* Answer options */}
      <div>
        <label className="label">Answer Options</label>
        <div className="flex flex-col gap-2">
          {form.options.map((opt, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <span className="text-slate-500 text-xs font-mono w-5 text-center">
                {idx + 1}
              </span>
              <input
                className="input-field"
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
              className="text-brand-400 hover:text-brand-300 text-xs font-semibold py-1"
            >
              + Add Option
            </button>
          )}
        </div>
      </div>

      {/* Workers / Reward / Deadline */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="label">Workers Required</label>
          <input
            type="number"
            min="3"
            className="input-field"
            value={form.workers}
            onChange={(e) => set({ workers: e.target.value })}
          />
          <p className="text-[11px] text-slate-500 mt-1">Minimum 3 workers.</p>
        </div>
        <div>
          <label className="label">Total Reward Budget (ETH)</label>
          <input
            type="number"
            step="0.0001"
            min="0.0001"
            className="input-field"
            value={form.reward}
            onChange={(e) => set({ reward: e.target.value })}
          />
          <p className="text-[11px] text-slate-500 mt-1">
            Fixed budget for this task. It is not multiplied by worker count.
          </p>
        </div>
        <div>
          <label className="label">Deadline (hours)</label>
          <input
            type="number"
            min="1"
            className="input-field"
            value={form.hours}
            onChange={(e) => set({ hours: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
