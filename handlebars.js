import { create } from 'express-handlebars'

const hbs = create({
  defaultLayout: 'main',
  layoutsDir: './views/layouts/',
  partialsDir: './views/partials/',
  helpers: {
    toJSON(object){
      return JSON.stringify(object, null, 2)
    }
  }
})

// hbs.registerPartial('myPartial', '{{prefix}}');

export default hbs
