"use client";

import { useState, useRef, useEffect } from 'react';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';
import { Pencil } from 'lucide-react';

type EditableTitleProps = {
    initialTitle: string;
    onSave?: (newTitle: string) => void;
    isEditable?: boolean;
    className?: string;
};

export function EditableTitle({ initialTitle, onSave, isEditable = true, className }: EditableTitleProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(initialTitle);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setTitle(initialTitle);
    }, [initialTitle]);

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [isEditing]);

    const handleSave = () => {
        if (title.trim() && onSave) {
            onSave(title.trim());
        } else {
            setTitle(initialTitle); // revert if empty
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            setTitle(initialTitle);
            setIsEditing(false);
        }
    };

    if (!isEditable) {
        return <h2 className={cn("text-xl font-semibold text-center text-foreground", className)}>{title}</h2>
    }

    if (isEditing) {
        return (
            <Input
                ref={inputRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                className={cn("text-xl font-semibold text-center text-foreground bg-transparent border-primary", className)}
            />
        );
    }

    return (
        <div
            className={cn("group flex items-center justify-center gap-2 cursor-pointer", className)}
            onClick={() => setIsEditing(true)}
        >
            <h2 className="text-xl font-semibold text-center text-foreground group-hover:text-primary transition-colors">{title}</h2>
            <Pencil className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    );
}
