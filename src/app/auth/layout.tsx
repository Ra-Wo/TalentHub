import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute top-6 left-6 z-20 sm:top-8 sm:left-10">
        <Link href="/" className="group pointer-events-auto inline-flex items-center gap-2">
          <Image src="/icon.png" alt="TalentHub" width={30} height={30} className="rounded" />
          <span className="text-foreground text-sm font-semibold group-hover:opacity-90 sm:text-base">
            TalentHub
          </span>
        </Link>
      </div>
      {children}
    </div>
  );
}
