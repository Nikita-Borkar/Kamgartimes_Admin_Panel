import React, { useEffect, useState } from 'react';
import kamgarLogo from '../assets/kamgar_times_with_logo.jpeg';
import { fetchPublicSiteSetting } from '../api/siteSettings';

export default function Logo({ size = 'md', showTagline = true, theme = 'dark' }) {
  const [siteLogos, setSiteLogos] = useState(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const settings = await fetchPublicSiteSetting();
        if (active) {
          setSiteLogos({
            light: settings?.logoLightUrl || settings?.logoUrl || '',
            dark: settings?.logoDarkUrl || settings?.logoUrl || settings?.logoLightUrl || '',
          });
        }
      } catch {
        // Keep the bundled logo as a fallback when site settings are unavailable.
      }
    };

    load();
    window.addEventListener('site-settings-updated', load);
    return () => {
      active = false;
      window.removeEventListener('site-settings-updated', load);
    };
  }, []);

  const imageHeights = {
    sm: 'h-8 sm:h-10',
    md: 'h-10 sm:h-12',
    lg: 'h-12 sm:h-16'
  };
  const logoSrc = (theme === 'dark' ? siteLogos?.dark : siteLogos?.light) || kamgarLogo;

  return (
    <div className="flex items-center gap-2 select-none group">
      <img 
        src={logoSrc}
        alt="Kamgar Times Logo" 
        className={`${imageHeights[size]} w-auto max-w-[min(48vw,15rem)] object-contain group-hover:scale-105 transition-transform duration-300`}
      />
    </div>
  );
}
