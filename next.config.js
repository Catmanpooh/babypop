/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    PRIVATE_KEY: process.env.PRIVATE_KEY,
    PROJECTID: process.env.PROJECTID,
    PROJECTSECRET: process.env.PROJECTSECRET,
    ALCHEMYID:  process.env.ALCHEMYID,
    BABYPOPUSERTABLE: process.env.BABYPOPUSERTABLE,
    BABYPOPPRODUCTTABLE: process.env.BABYPOPPRODUCTTABLE,
    LIVEPEERAPIKEY: process.env.LIVEPEERAPIKEY
  },
}

module.exports = nextConfig
