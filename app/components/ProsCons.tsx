import { ThumbsDownIcon, ThumbsUpIcon } from 'lucide-react';

interface ProsConsProps {
    title?: string;
    pros?: string[];
    cons?: string[];
}

export function ProsCons({ title, pros = [], cons = [] }: ProsConsProps) {
    return (
        <div className="rounded-box border-base-300 bg-base-200 mt-2 border p-4">
            {title && <h3 className="mb-3 font-semibold">{title}</h3>}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <div className="text-success mb-2 flex items-center gap-1 text-sm font-semibold">
                        <ThumbsUpIcon className="h-4 w-4" aria-hidden="true" />
                        Pros
                    </div>
                    <ul className="space-y-1">
                        {pros.map((pro, i) => (
                            <li
                                key={i}
                                className="text-base-content/80 flex items-start gap-1.5 text-sm"
                            >
                                <span className="text-success mt-0.5">+</span>
                                {pro}
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <div className="text-error mb-2 flex items-center gap-1 text-sm font-semibold">
                        <ThumbsDownIcon
                            className="h-4 w-4"
                            aria-hidden="true"
                        />
                        Cons
                    </div>
                    <ul className="space-y-1">
                        {cons.map((con, i) => (
                            <li
                                key={i}
                                className="text-base-content/80 flex items-start gap-1.5 text-sm"
                            >
                                <span className="text-error mt-0.5">
                                    &minus;
                                </span>
                                {con}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
