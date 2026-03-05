interface DataRow {
    label?: string;
    value?: string;
}

interface DataTableProps {
    title?: string;
    rows?: DataRow[];
}

export function DataTable({ title, rows = [] }: DataTableProps) {
    return (
        <div className="rounded-box border-base-300 bg-base-200 mt-2 overflow-hidden border">
            {title && (
                <div className="border-base-300 border-b px-4 py-2">
                    <h3 className="font-semibold">{title}</h3>
                </div>
            )}
            <table className="table-sm table w-full">
                <tbody>
                    {rows.map((row, i) => (
                        <tr key={i}>
                            <td className="text-base-content/60 font-medium">
                                {row.label}
                            </td>
                            <td>{row.value}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
