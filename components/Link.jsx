export const slugsToHrefs = {
    "improve-this-website": "project-improve-this-website.html",
    "projects-on-this-site": "project-track-my-projects.html",
    "about-project-logs": "topic-project-logs.html"
}
export const Link = ({ slug, children }) => {
    const href = slugsToHrefs[slug];
    if (!href) console.error(`No href found for slug "${slug}"`)
    return <a href={href}>{children}</a>
}
