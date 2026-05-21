import Image from "next/image";
import SignOutForm from "../components/SignOutForm";
// import type { Employee, Item, SignOut } from '@prisma/client'

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <h1>WMSC Uniform Manager!</h1>
        <SignOutForm />
    </div>
  );
}
