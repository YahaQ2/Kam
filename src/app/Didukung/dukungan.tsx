import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string | JSX.Element;
}

const App = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: "Apa itu Unandfess?",
      answer: "Unandfess adalah platform menfess (mention confession) yang memungkinkan pengguna untuk berbagi pesan secara anonim."
    },
    {
      question: "Apakah menfess saya benar-benar anonim?",
      answer: "Ya, semua menfess di Unandfess bersifat anonim. Kami tidak menyimpan informasi yang dapat mengidentifikasi pengirim."
    },
    {
      question: "Apa itu Ziwa?",
      answer: <>
        Visi Kami: Kami ingin menyediakan wadah di mana setiap orang merasa didukung dengan KASIH SAYANG dan KEHANGATAN<br /><br />
        Perjalanan Kami: Ziwa telah memiliki komunitas sejak Tahun 2022. Sejak itu, banyak hal yang telah kami lakukan dengan misi utama memberikan ruang aman bagi generasi muda, khususnya Generasi Z dan Milenial. Kami berusaha mewujudkan pencarian mereka terhadap komunitas yang mendukung.
      </>
    },
    {
      question: "Apakah saya bisa memberikan charity?",
      answer: <>
        Tentunya kami sangat berbahagia jika Anda ingin berbagi untuk mendukung program kami. Ziwa adalah organisasi nonprofit. Anda bisa kunjungi <a href="https://www.ziwaku.com" target="_blank" style={{ color: '#2463eb' }}>ziwaku.com</a> untuk informasi lebih lanjut. Untuk mendukung website Unandfess, Anda bisa menggunakan link Saweria di bawah.
      </>
    }
  ];

  return (
    <div>
      <style>
        {`
          :root {
            --primary-color: #2463eb;
            --text-color: #1f2937;
            --light-gray: #f3f4f6;
            --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          }

          body {
            background-color: #ffffff;
            line-height: 1.5;
            color: var(--text-color);
            min-height: 100vh;
            position: relative;
          }

          .container {
            max-width: 800px;
            margin: 5rem auto;
            padding: 0 1.5rem 100px;
          }

          .header {
            text-align: center;
            margin-bottom: 4rem;
          }

          .header h1 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 1rem;
            background: linear-gradient(45deg, #2563eb, #1d4ed8);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }

          .header p {
            color: #6b7280;
            font-size: 1.125rem;
          }

          .faq-item {
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            margin-bottom: 1rem;
            transition: var(--transition);
            background-color: white;
          }

          .faq-item:hover {
            border-color: var(--primary-color);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }

          .question {
            padding: 1.5rem;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: 500;
          }

          .question h3 {
            font-size: 1.125rem;
            margin-right: 1rem;
          }

          .icon {
            width: 24px;
            height: 24px;
            flex-shrink: 0;
            transition: var(--transition);
          }

          .answer {
            padding: 0 1.5rem;
            max-height: 0;
            overflow: hidden;
            transition: var(--transition);
          }

          .answer p {
            color: #4b5563;
            padding-bottom: 1.5rem;
            line-height: 1.6;
          }

          .faq-item.active {
            border-color: var(--primary-color);
            background-color: var(--light-gray);
          }

          .faq-item.active .icon {
            transform: rotate(45deg);
          }

          .faq-item.active .answer {
            max-height: 500px;
            padding-top: 0.5rem;
          }

          .footer {
            text-align: center;
            padding: 3rem 0;
            color: #6b7280;
            font-size: 0.875rem;
            position: absolute;
            bottom: 0;
            width: 100%;
          }

          .saweria-button {
            background-color: #000;
            color: white;
            padding: 15px 30px;
            border: none;
            border-radius: 25px;
            cursor: pointer;
            font-size: 18px;
            font-weight: bold;
            transition: all 0.3s ease;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
          }

          .saweria-button:hover {
            background-color: #f00;
            transform: translateX(-50%) translateY(-2px);
            box-shadow: 0 6px 8px rgba(0, 0, 0, 0.2);
          }

          .saweria-button:active {
            transform: translateX(-50%) translateY(0);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }

          @media (max-width: 640px) {
            .container {
              margin: 3rem auto;
            }
            
            .header h1 {
              font-size: 2rem;
            }
            
            .saweria-button {
              font-size: 16px;
              padding: 12px 24px;
            }
          }
        `}
      </style>

      <div className="container">
        <div className="header">
          <h1>UNANDFESS.XYZ</h1>
          <p>Find answers to common questions about our services</p>
        </div>

        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className={`faq-item ${activeIndex === index ? 'active' : ''}`}
              onClick={() => setActiveIndex(activeIndex === index ? null : index)}
            >
              <div className="question">
                <h3>{faq.question}</h3>
                <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
              </div>
              <div className="answer">
                {typeof faq.answer === 'string' ? <p>{faq.answer}</p> : faq.answer}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="footer">
        <p>© 2024 frchorp. All rights reserved</p>
      </div>
      
      <button 
        className="saweria-button"
        onClick={() => window.location.href = 'https://saweria.co/Freyyputt'}
      >
        Dukung Kami di Saweria
      </button>
    </div>
  );
};

export default App;