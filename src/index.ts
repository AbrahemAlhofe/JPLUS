// Interfaces

const globalAll: any = global

interface Object {
  [key: string] : any
}
/*

  jplus ()
    static add( methodName: string, method: Function ); void

*/
globalAll.jplus = class jplus {
  static add(methodName: string, method: Function): void {
    // Inject method into HTMLElement
    Object.prototype[methodName] = function () {
      // if Object is not HTMLELement throw an TypeError
      if ( this instanceof HTMLElement ) return method.call(this, ...arguments)
      else throw new TypeError(`You couldn't use ${methodName} with non HTMLElement`)
    }

    // Make method enumerable
    Object.defineProperty(Object.prototype, methodName, { enumerable: false });
  }
}

exports.jplus = globalAll.jplus;

/*

  $(query: string): ELement | Element[]
    for searching in document by query alternative to document.querySelector/All()

*/

globalAll.$ = function $(query: string): Element | Element[] {
  // IF : query is HTML element stracture
  if (query.trim()[0] === "<") {
    const div = document.createElement("div");
    div.innerHTML = query;
    return div.children[0];
  }

  // search in document by query
  const result: NodeListOf<any> = document.querySelectorAll(query);

  // IF : result is multiable of elements return it, else return one element
  return result.length === 1 ? result[0] : result;
};

exports.$ = globalAll.$

/*

  getAttr(attributes: string | string[])

  Setuations :
    <div class="box" data-number="123" ></div>

    getAttr() => { class : 'box', data-number : 123 }

    getAttr('class') => 'box'

    getAttr('data-number') => 123

    getAttr(['class', 'data-number']) => { class : 'box', data-number : 123 }

*/

globalAll.jplus.add("getAttr", function (
  qualifiedName: string | string[]
): null | string | number | { [key: string]: any } {
  const element: HTMLElement = this;
  const attributes: { [key: string]: any } = {};

  function evaluate (string: string) {
    try {
      return JSON.parse(string)
    } catch (err) {
      return string
    }
  }

  if ( typeof qualifiedName == "string" ) return evaluate( String( element.getAttribute(qualifiedName) ) );

  if ( Array.isArray( qualifiedName ) ) qualifiedName.forEach(arg => {
    attributes[arg] = evaluate(String(element.getAttribute(arg)));
  })

  for ( let attribute of Array.from( element.attributes ) ) attributes[ attribute.name ] = evaluate( attribute.value )

  return attributes;
});