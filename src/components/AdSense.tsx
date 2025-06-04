
import Script from 'next/script'

const AdSense = () => {
  return (
    <Script
      id="adsense-init"
      strategy="afterInteractive"
      onError={(e) => console.error('Script failed to load', e)}
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7644025135360982"
      crossOrigin="anonymous"
    />
  )
}

export default AdSense
