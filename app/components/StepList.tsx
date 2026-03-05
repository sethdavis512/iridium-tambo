import { CheckCircle2Icon, CircleIcon } from 'lucide-react';

interface Step {
    label?: string;
    detail?: string;
    done?: boolean;
}

interface StepListProps {
    title?: string;
    steps?: Step[];
}

export function StepList({ title, steps = [] }: StepListProps) {
    return (
        <div className="rounded-box border-base-300 bg-base-200 mt-2 border p-4">
            {title && <h3 className="mb-3 font-semibold">{title}</h3>}
            <ol className="space-y-2">
                {steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2">
                        {step.done ? (
                            <CheckCircle2Icon
                                className="text-success mt-0.5 h-4 w-4 shrink-0"
                                aria-hidden="true"
                            />
                        ) : (
                            <CircleIcon
                                className="text-base-content/40 mt-0.5 h-4 w-4 shrink-0"
                                aria-hidden="true"
                            />
                        )}
                        <div className="min-w-0">
                            <span
                                className={
                                    step.done
                                        ? 'text-base-content/60 line-through'
                                        : 'font-medium'
                                }
                            >
                                {step.label ?? `Step ${i + 1}`}
                            </span>
                            {step.detail && (
                                <p className="text-base-content/60 text-xs">
                                    {step.detail}
                                </p>
                            )}
                        </div>
                    </li>
                ))}
            </ol>
        </div>
    );
}
