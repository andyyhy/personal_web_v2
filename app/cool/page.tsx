import 'tailwindcss/tailwind.css';
import Iframe from 'react-iframe';
import Image from 'next/image';

export default function CoolPage() {
  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl w-full mx-auto p-4 sm:p-6 md:p-8">
        <section className="mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight lg:text-5xl mb-4">
            Iceland Mini Movie
          </h2>
          <div className="relative shadow-xl" style={{ paddingBottom: '56.25%', height: 0 }}>
            <Iframe 
                className="absolute top-0 left-0 w-full h-full"
                url="https://www.youtube.com/embed/enI-_nszpuY?si=oYRnAx0C1ZdNiPbK" 
                title="YouTube video player" 
                frameBorder={0} 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                referrerpolicy="strict-origin-when-cross-origin" 
                allowFullScreen
            />
          </div>
        </section>
        <section className="mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight lg:text-5xl mb-4">
            Photo Gallery
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Image src="/photos/photo1.jpeg" alt="Photo 1" className="w-full h-auto object-contain rounded-lg" width={500} height={500} />
            <Image src="/photos/photo2.jpeg" alt="Photo 2" className="w-full h-auto object-contain rounded-lg" width={500} height={500} />
            <Image src="/photos/photo3.jpeg" alt="Photo 3" className="w-full h-auto object-contain rounded-lg" width={500} height={500} />
            <Image src="/photos/photo4.jpeg" alt="Photo 4" className="w-full h-auto object-contain rounded-lg" width={500} height={500} />
            <Image src="/photos/photo5.jpeg" alt="Photo 5" className="w-full h-auto object-contain rounded-lg" width={500} height={500} />
            <Image src="/photos/photo6.jpeg" alt="Photo 6" className="w-full h-auto object-contain rounded-lg" width={500} height={500} />
          </div>
        </section>
      </div>
    </div>
  );
}