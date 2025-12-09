
'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
  } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CodeBlock from "./code-block";

type EmbedCodeDialogProps = {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    embedCode: string;
};

export default function EmbedCodeDialog({ isOpen, onOpenChange, embedCode }: EmbedCodeDialogProps) {
    const { toast } = useToast();

    const handleCopy = () => {
        navigator.clipboard.writeText(embedCode);
        toast({
            title: "Copied to Clipboard",
            description: "The embed code has been copied.",
        });
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Embed Your Bot</DialogTitle>
                    <DialogDescription>
                        Copy and paste this code into the `<body>` of your HTML file to add this bot to your website.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <CodeBlock language="html" value={embedCode} />
                </div>
                <DialogFooter>
                    <Button onClick={handleCopy}>
                        <Copy className="mr-2 h-4 w-4" /> Copy Code
                    </Button>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
