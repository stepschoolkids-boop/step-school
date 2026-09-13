import Link from "next/link";
import { Riko } from "@/components/brand/Riko";

export default function NotFound() {
  return (
    <main className="container-x flex min-h-dvh flex-col items-center justify-center py-24 text-center">
      <Riko className="w-48" label="Riko yo‘lini yo‘qotib qo‘ydi" />
      <h1 className="headline mt-8 text-4xl">Bu sahifa topilmadi</h1>
      <p className="mt-3 max-w-md text-ink-soft">Riko ham adashib qoldi. Bosh sahifaga qaytib, yo‘lni birga davom ettiramiz.</p>
      <Link href="/" className="btn-primary mt-8 inline-flex h-12 items-center rounded-full px-6 font-display font-semibold">
        Bosh sahifaga
      </Link>
    </main>
  );
}
