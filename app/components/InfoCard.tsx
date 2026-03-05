import {
    AlertTriangleIcon,
    CheckCircle2Icon,
    InfoIcon,
    LightbulbIcon,
    XCircleIcon,
} from 'lucide-react';
import { Markdown } from './Markdown';

const VARIANT_STYLES: Record<
    string,
    { bg: string; border: string; icon: typeof InfoIcon }
> = {
    info: { bg: 'bg-info/10', border: 'border-info/30', icon: InfoIcon },
    success: {
        bg: 'bg-success/10',
        border: 'border-success/30',
        icon: CheckCircle2Icon,
    },
    warning: {
        bg: 'bg-warning/10',
        border: 'border-warning/30',
        icon: AlertTriangleIcon,
    },
    error: { bg: 'bg-error/10', border: 'border-error/30', icon: XCircleIcon },
    tip: {
        bg: 'bg-accent/10',
        border: 'border-accent/30',
        icon: LightbulbIcon,
    },
};

interface InfoCardProps {
    title?: string;
    body?: string;
    variant?: string;
}

export function InfoCard({ title, body, variant = 'info' }: InfoCardProps) {
    const style = VARIANT_STYLES[variant] ?? VARIANT_STYLES.info;
    const Icon = style.icon;
    return (
        <div
            className={`rounded-box mt-2 border p-4 ${style.bg} ${style.border}`}
        >
            <div className="flex items-start gap-2">
                <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                <div className="min-w-0">
                    {title && <h3 className="mb-1 font-semibold">{title}</h3>}
                    {body && <Markdown>{body}</Markdown>}
                </div>
            </div>
        </div>
    );
}
