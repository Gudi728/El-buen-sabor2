class Product {
  constructor({ id, categorySlug, name, image, price, ingredients }) {
    this.id = id;
    this.categorySlug = categorySlug;
    this.name = name;
    this.image = image;
    this.price = price;
    this.ingredients = ingredients;
  }
}

module.exports = Product;