import { useEffect, useRef } from 'react';
import { Hero } from '../components/home/Hero';
import { NewCollection } from '../components/home/NewCollection';
import { Departments } from '../components/home/Departments';
import { Editorial } from '../components/home/Editorial';
import { Kids } from '../components/home/Kids';
import { SaleStory } from '../components/home/SaleStory';
import { Brands } from '../components/home/Brands';
import { ClubStores } from '../components/home/ClubStores';
import { useHeroFlight } from '../hooks/useHeroFlight';
import { cut, HERO_PRODUCT } from '../data/catalog';

export default function HomePage() {
  const stage = useRef<HTMLDivElement>(null);
  useHeroFlight(stage);
  useEffect(() => { document.title = 'גלי – רשת הנעליים של ישראל | Gali (Concept)'; }, []);
  return (
    <>
      <div ref={stage} className="flight-stage relative">
        <Hero />
        <NewCollection />
        <div data-flyer aria-hidden className="flyer pointer-events-none absolute z-40 hidden">
          <img src={cut(HERO_PRODUCT)} alt="" className="flyer-img size-full object-contain drop-shadow-[0_28px_24px_rgb(21_21_20/0.22)]" />
        </div>
      </div>
      <Departments />
      <Editorial />
      <Kids />
      <SaleStory />
      <Brands />
      <ClubStores />
    </>
  );
}
