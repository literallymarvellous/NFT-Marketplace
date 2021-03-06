import Link from "next/link"

const Navigation = () => {
  return (
    <nav className="border-b p-6">
      <p className="text-4xl font-bold">NFT Marketplace</p>
      <div className="flex mt-4">
        <Link href="/">
          <a className="mr-4 text-pink-500">Home</a>
        </Link>
        <Link href="/listItem">
          <a className="mr-6 text-pink-500">Sell Digital Asset</a>
        </Link>
        <Link href="/myAssets">
          <a className="mr-6 text-pink-500">My Digital Assets</a>
        </Link>
        <Link href="/creatorDashboard">
          <a className="mr-6 text-pink-500">Creator Dashboard</a>
        </Link>
      </div>
    </nav>
  );
}

export default Navigation