
import { Link } from 'react-router' 

const Nav = () => {
  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="text-lg font-bold">Prueba React</div>

 
        <ul className="flex space-x-4">
          <li>
            <Link to="/home" className="hover:text-gray-200">
              Home
            </Link>
          </li>
          <li>
            <Link to="/post" className="hover:text-gray-200">
              Post
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Nav