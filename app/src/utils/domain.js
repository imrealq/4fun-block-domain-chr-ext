export const getDomain = (url) => {
  try {
    const domain = new URL(url).hostname
    return domain
  } catch {
    return url.trim()
  }
}

export const isValidDomain = (url) => {
  const pattern = /^((?!-)[A-Za-z0-9-]{1,63}(?<!-)\.)+[A-Za-z]{2,6}$/
  const domain = getDomain(url)
  return pattern.test(domain)
}

export const isDomainExisted = (domains, domain) => {
  return domains.some((item) => item.domain === domain)
}
