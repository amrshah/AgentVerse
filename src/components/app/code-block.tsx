
"use client";

import { FC, memo } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";

interface CodeBlockProps {
  language: string;
  value: string;
}

const CodeBlock: FC<CodeBlockProps> = memo(({ language, value }) => {
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    toast({ title: "Code Copied!", description: "The code block has been copied to your clipboard." });
  };

  return (
    <div className="relative w-full font-sans text-sm bg-[#1e1e1e] rounded-md overflow-hidden">
      <div className="flex items-center justify-between w-full px-4 py-2 bg-gray-700 text-gray-200">
        <span className="text-xs lowercase">{language}</span>
        <Button variant="ghost" size="icon" onClick={handleCopy} className="h-6 w-6 hover:bg-gray-600">
          <Copy className="h-4 w-4" />
        </Button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{ margin: 0, padding: "1rem", width: "100%" }}
        codeTagProps={{ style: { fontFamily: "var(--font-code)" } }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
});

CodeBlock.displayName = 'CodeBlock';
export default CodeBlock;
