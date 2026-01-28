export default function AccountsDashboard({ user }: { user: any }) {
  return (
    <div className="bg-green-800 text-white p-8 rounded-2xl shadow-lg">
      <h1 className="text-3xl font-bold">💰 Finance & Accounts</h1>
      <p>Billing Dashboard for {user.name}</p>
    </div>
  );
}