exports.getHomepage = (req, res) => {
    res.status(200).render("homepage", {
      title: "Homepage",
    });
}