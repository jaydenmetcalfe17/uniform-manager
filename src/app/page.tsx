import SignOutForm from "@/components/SignOutForm"
import SignInForm from "@/components/SignInForm"

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black gap-12 p-4 md:p-8">
      <SignOutForm />
      <hr className="w-full max-w-md border-gray-200" />
      <SignInForm />
    </div>
  )
}