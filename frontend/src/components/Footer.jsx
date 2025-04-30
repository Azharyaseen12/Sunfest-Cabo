import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router'

import { Button } from '@mui/material'

export default function Footer() {
	const navigate = useNavigate()
	const location = useLocation()

	const handleClick = (e, href) => {
		e.preventDefault()
		if (href.startsWith('#')) {
			// If we're not on the home page, navigate there first
			if (location.pathname !== '/home') {
				navigate('/home')
				// Wait for navigation to complete before scrolling
				setTimeout(() => {
					const element = document.querySelector(href)
					if (element) {
						element.scrollIntoView({ behavior: 'smooth' })
					}
				}, 100)
			} else {
				const element = document.querySelector(href)
				if (element) {
					element.scrollIntoView({ behavior: 'smooth' })
				}
			}
		} else {
			navigate(href)
		}
	}

	return (
		<footer className="bg-[#F821DB1A] text-white pt-12 pb-4">
			<div className="container mx-auto px-4">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
					{/* Logo and Description */}
					<div className="col-span-1">
						<img
							src="/hero.png"
							alt="Inclufy AI"
							className="h-60 w-auto mb-4 cursor-pointer"
							onClick={(e) => handleClick(e, '/home')}
						/>
					</div>

					{/* Quick Links */}
					<div className="col-span-1">
						<h3 className="text-lg font-semibold mb-4">Navigation</h3>
						<ul className="space-y-2">
							<li>
								<Link to="/home" className="hover:text-gray-300">
									Homepage
								</Link>
							</li>
							<li>
								<a
									href="#about-us"
									onClick={(e) => handleClick(e, '#about-us')}
									className="hover:text-gray-300"
								>
									Our Packages
								</a>
							</li>
							<li>
								<a
									href="#our-features"
									onClick={(e) => handleClick(e, '#our-features')}
									className="hover:text-gray-300"
								>
									FAQs
								</a>
							</li>
							<li>
								<a
									href="#pricing"
									onClick={(e) => handleClick(e, '#pricing')}
									className="hover:text-gray-300"
								>
									Features
								</a>
							</li>
						</ul>
					</div>

					{/* Information */}
					<div className="col-span-1">
						<h3 className="text-lg font-semibold mb-4">Information</h3>
						<p className="text-[#707070]">
							Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam,
							quos.
						</p>
						<div className="flex space-x-4 mt-4">
							<Link to="#" className="hover:text-footer-bg transition-colors">
								<svg
									className="w-6 h-6"
									fill="currentColor"
									viewBox="0 0 24 24"
								>
									<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
								</svg>
							</Link>
							<Link href="#" className="hover:text-footer-bg transition-colors">
								<svg
									className="w-6 h-6"
									fill="currentColor"
									viewBox="0 0 24 24"
								>
									<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
								</svg>
							</Link>
							<Link href="#" className="hover:text-footer-bg transition-colors">
								<svg
									className="w-6 h-6"
									fill="currentColor"
									viewBox="0 0 24 24"
								>
									<path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
								</svg>
							</Link>
						</div>
					</div>

					{/* Contact Us */}
					<div className="col-span-1 flex justify-end items-top">
						<Button variant="contained" color="primary" className="w-30 h-10">
							Login
						</Button>
					</div>
				</div>

				{/* Copyright */}
				<div className="border-t border-[#F821DB] pt-2 flex justify-between items-center">
					<p className="text-[#F821DB]">
						All the rights reserved - Sunset Fest Cabo
					</p>
					<div>
						<Button variant="text" color="primary" className="w-30 pt-2">
							Disclaimer
						</Button>
						<Button
							variant="text"
							color="primary"
							className="w-30 text-nowrap pt-2"
						>
							Privacy Policy
						</Button>
						<Button
							variant="text"
							color="primary"
							className="w-40 text-nowrap pt-2"
						>
							Terms of Service
						</Button>
					</div>
				</div>
			</div>
		</footer>
	)
}
