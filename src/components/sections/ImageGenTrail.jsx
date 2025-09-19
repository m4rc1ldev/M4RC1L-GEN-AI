import ImageTrail from '@/components/features/image-gen/image-trail'
import { Button } from "@/components/ui/button";
import Link from "next/link";



export default function ImageGenTrail(){
    return(
        <div className='h-screen relative overflow-hidden bg-[#333333] '>
          
             <div className="max-w-3xl w-full flex-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2  flex flex-col items-center text-center">
                   
                    <h1 className="text-8xl font-bold md:lg text-white/60  lg:leading-relaxed font-mono max-w-xl">
                      Image Gen
                    </h1>
                    <h4 className='mb-10 text-white font-mono font-light'>Introducing Imagegen, now you can generate <br /> images using imagegen</h4>
                               
                  </div>
  <ImageTrail
    items={[
      'https://picsum.photos/id/287/300/300',
      'https://picsum.photos/id/1001/300/300',
      'https://picsum.photos/id/1025/300/300',
      'https://picsum.photos/id/1026/300/300',
      'https://picsum.photos/id/1027/300/300',
      'https://picsum.photos/id/1028/300/300',
      'https://picsum.photos/id/1029/300/300',
      'https://picsum.photos/id/1030/300/300',
    ]}
    variant={4}
  />
    <div className="flex gap-4 flex-wrap justify-center z-[101] absolute left-1/2 -translate-x-1/2 top-[80%] md:top-2/3">
      <Button variant="outline" asChild className="rounded-full font-mono px-6 h-11 cursor-pointer font-light hover:bg-black hover:text-white transition-colors duration-300 ease-in-out">
        <Link href="/image-gen">Try Now !</Link>
      </Button>
    </div>   
  
</div>
    )
}