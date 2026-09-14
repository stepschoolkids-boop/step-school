import Link from "next/link";
import { Riko } from "@/components/brand/Riko";

export default function NotFound() {
  return (
    <main className="container-x flex min-h-dvh flex-col items-center justify-center py-24 text-center">
      <Riko variant="read" sizes="200px" className="w-48" />
      <h1 className="headline mt-8 text-4xl text-white">Bu sahifa topilmadi</h1>
      <p className="mt-3 max-w-md text-white/65">Riko ham adashib qoldi. Bosh sahifaga qaytib, yo‘lni birga davom ettiramiz.</p>
      <Link href="/" className="btn-primary mt-8 inline-flex h-12 items-center rounded-full px-6 font-bold">
        Bosh sahifaga
      </Link>
    </main>
  );
}
