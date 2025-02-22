import InsuranceForm from "@/components/insurance-form"
import Image from "next/image"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative">
      {/* Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      <div className="container mx-auto space-y-6 p-4 relative">
        <div className="flex justify-center mb-8">
          <div className="w-[300px] h-[100px] relative">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-DbW5A7kTi1dq2iBJu3Qk8eS3IINMdM.png"
              alt="LeoSource Insurance Agency"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold mb-6 text-primary">Insurance Application Form</h1>
          <InsuranceForm />
        </div>
      </div>
    </main>
  )
}

