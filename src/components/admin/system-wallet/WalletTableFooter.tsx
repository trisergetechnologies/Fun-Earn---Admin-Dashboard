"use client";

type Props = {
  summary: string;
  pagination?: ReactNode;
};

export default function WalletTableFooter({ summary, pagination }: Props) {
  return (
    <div className="flex flex-col gap-3 border-t border-gray-100 bg-gray-50/60 px-5 py-4 dark:border-gray-800 dark:bg-gray-900/25 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p className="text-sm text-gray-600 dark:text-gray-400">{summary}</p>
      {pagination ? <div className="flex justify-end">{pagination}</div> : null}
    </div>
  );
}
