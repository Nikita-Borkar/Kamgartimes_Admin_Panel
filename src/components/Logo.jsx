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
            textLight: settings?.textLogoLightUrl || '',
            textDark: settings?.textLogoDarkUrl || settings?.textLogoLightUrl || '',
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

  const emblemSrc = (theme === 'dark' ? siteLogos?.dark : siteLogos?.light) || kamgarLogo;
  const textSrc = theme === 'dark' ? siteLogos?.textDark : siteLogos?.textLight;

  return (
    <div className="flex items-center gap-2 select-none group">
      <img 
        src={emblemSrc}
        alt="Kamgar Times Logo" 
        className={`${imageHeights[size]} w-auto max-w-[min(48vw,15rem)] object-contain group-hover:scale-105 transition-transform duration-300`}
      />
      {textSrc ? (
        <img 
          src={textSrc}
          alt="Kamgar Times"
          className={`${imageHeights[size]} w-auto max-w-[min(48vw,15rem)] object-contain group-hover:scale-105 transition-transform duration-300`}
        />
      ) : null}
    </div>
  );
}
