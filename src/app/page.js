import Link from "next/link";

export default function Home() {
  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold mb-4">Welcome to EasyApply</h1>

      <div className="flex flex-col gap-4 mt-6">
        <Link href="/signup" className="text-blue-400 underline">
          Go to Signup
        </Link>

        <Link href="/login" className="text-blue-400 underline">
          Go to Login
        </Link>

        <Link href="/profile" className="text-blue-400 underline">
          Go to Profile
        </Link>
      </div>
    </div>
  );
}
