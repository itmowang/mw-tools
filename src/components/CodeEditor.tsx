import React from "react";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import "prismjs/themes/prism.css";
import "prismjs/components/prism-markup"; // html/svg
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-json";
import "prismjs/components/prism-css";
import "prismjs/components/prism-javascript";

export type CodeEditorProps = {
  value: string;
  onChange: (v: string) => void;
  language?: string; // e.g., 'markup' | 'markdown' | 'json' | 'css' | 'javascript'
  placeholder?: string;
  readOnly?: boolean;
  minHeight?: number;
  className?: string;
};

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language = "markup",
  placeholder,
  readOnly = false,
  minHeight = 280,
  className,
}) => {
  return (
    <div
      className={
        "rounded-md border bg-background text-foreground shadow-sm focus-within:ring-2 focus-within:ring-primary/30 " +
        (className || "")
      }
      style={{
        borderColor: "hsl(var(--border))",
      }}
    >
      <Editor
        value={value}
        onValueChange={onChange}
        highlight={(code) => Prism.highlight(code, Prism.languages[language] || Prism.languages.markup, language)}
        padding={12}
        textareaId="code-editor"
        textareaClassName="outline-none"
        placeholder={placeholder}
        readOnly={readOnly}
        style={{
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          fontSize: 13,
          minHeight,
          background: "transparent",
        }}
      />
    </div>
  );
};

export default CodeEditor;
