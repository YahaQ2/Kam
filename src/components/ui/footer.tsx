import { FaTwitter, FaInstagram, FaGithub } from 'react-icons/fa'

export function Footer() {
  return (
    <footer className="bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-600">copy© 2024 unandfess. Terinspirasi dari website sendthesong.xyz</p>
          </div>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-600 hover:text-gray-800">
              <FaTwitter size={20} />
            </a>
            <a href="https://www.instagram.com/" className="text-gray-600 hover:text-gray-800">
              <FaInstagram size={20} />
            </a>
            <a href="https://github.com/ferpt" className="text-gray-600 hover:text-gray-800">
              <FaGithub size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

