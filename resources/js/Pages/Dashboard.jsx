import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, usePage } from "@inertiajs/react";

export default function Dashboard() {
    const { users } = usePage().props;

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h3 className="mb-4 text-lg font-semibold">
                                Users
                            </h3>

                            {!users ? (
                                <div>Loading...</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    ID
                                                </th>
                                                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    Name
                                                </th>
                                                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    Email
                                                </th>
                                                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    Joined
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {(users.data || []).map((u) => (
                                                <tr key={u.id}>
                                                    <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-700">
                                                        {u.id}
                                                    </td>
                                                    <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-700">
                                                        {u.name}
                                                    </td>
                                                    <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-700">
                                                        {u.email}
                                                    </td>
                                                    <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-700">
                                                        {new Date(
                                                            u.created_at
                                                        ).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))}
                                            {users.data &&
                                                users.data.length === 0 && (
                                                    <tr>
                                                        <td
                                                            className="px-4 py-4 text-center text-sm text-gray-500"
                                                            colSpan={4}
                                                        >
                                                            No users found.
                                                        </td>
                                                    </tr>
                                                )}
                                        </tbody>
                                    </table>

                                    {Array.isArray(users.links) &&
                                        users.links.length > 0 && (
                                            <div className="mt-4 flex flex-wrap items-center gap-2">
                                                {users.links.map(
                                                    (link, idx) => (
                                                        <Link
                                                            key={`${link.label}-${idx}`}
                                                            href={
                                                                link.url || "#"
                                                            }
                                                            className={`rounded border px-3 py-1 text-sm ${
                                                                link.active
                                                                    ? "border-gray-700 bg-gray-700 text-white"
                                                                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                                                            } ${
                                                                !link.url
                                                                    ? "pointer-events-none opacity-50"
                                                                    : ""
                                                            }`}
                                                            dangerouslySetInnerHTML={{
                                                                __html: link.label,
                                                            }}
                                                        />
                                                    )
                                                )}
                                            </div>
                                        )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
