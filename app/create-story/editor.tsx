"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from "lucide-react";

export interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function Editor({ value, onChange }: EditorProps) {
  const [fontSize, setFontSize] = useState("16");
  const [fontFamily, setFontFamily] = useState("Georgia");
  const [textAlign, setTextAlign] = useState("left");

  const fonts = [
    "Georgia",
    "Times New Roman",
    "Garamond",
    "Baskerville",
    "Palatino",
    "Cambria",
  ];

  const fontSizes = ["14", "16", "18", "20", "24", "28", "32", "36"];

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center gap-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-4 rounded-xl border border-amber-200/30 dark:border-amber-800/30">
        <div className="w-40">
          <Select value={fontFamily} onValueChange={setFontFamily}>
            <SelectTrigger className="border-amber-200/50 dark:border-amber-800/50 bg-white/50 dark:bg-gray-900/50 text-foreground">
              <SelectValue placeholder="Font" />
            </SelectTrigger>
            <SelectContent className="text-foreground">
              {fonts.map((font) => (
                <SelectItem key={font} value={font}>
                  {font}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-24">
          <Select value={fontSize} onValueChange={setFontSize}>
            <SelectTrigger className="border-amber-200/50 dark:border-amber-800/50 bg-white/50 dark:bg-gray-900/50 text-foreground">
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent className="text-foreground">
              {fontSizes.map((size) => (
                <SelectItem key={size} value={size}>
                  {size}px
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <ToggleGroup
          type="single"
          value={textAlign}
          onValueChange={setTextAlign}
          className="border border-amber-200/30 dark:border-amber-800/30 rounded-lg"
        >
          <ToggleGroupItem
            value="left"
            aria-label="Align left"
            className="data-[state=on]:bg-amber-100/50 dark:data-[state=on]:bg-amber-900/50"
          >
            <AlignLeft className="h-4 w-4 text-amber-900 dark:text-amber-100" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="center"
            aria-label="Align center"
            className="data-[state=on]:bg-amber-100/50 dark:data-[state=on]:bg-amber-900/50"
          >
            <AlignCenter className="h-4 w-4 text-amber-900 dark:text-amber-100" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="right"
            aria-label="Align right"
            className="data-[state=on]:bg-amber-100/50 dark:data-[state=on]:bg-amber-900/50"
          >
            <AlignRight className="h-4 w-4 text-amber-900 dark:text-amber-100" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="justify"
            aria-label="Justify"
            className="data-[state=on]:bg-amber-100/50 dark:data-[state=on]:bg-amber-900/50"
          >
            <AlignJustify className="h-4 w-4 text-amber-900 dark:text-amber-100" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="w-full relative p-8">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-full min-h-[calc(100vh-300px)] p-8 resize-none focus:outline-none bg-transparent text-foreground placeholder:text-muted-foreground"
          style={{
            fontFamily,
            fontSize: `${fontSize}px`,
            textAlign: textAlign as "left" | "center" | "right" | "justify",
          }}
          placeholder="Start writing your story..."
        />
      </div>
    </div>
  );
}
