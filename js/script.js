NodeList.prototype.forEach = Array.prototype.forEach;
NodeList.prototype.filter = Array.prototype.filter;

var hash = {
    read: function () {
        var obj = window.location.hash
            .replace( '#', '' )
            .split( '&' )
                .reduce( function( obj, value ) {
                if ( value === '' ) return;
                var parts = value.split('=');
                obj[ parts[ 0 ] ] = parts[ 1 ];
                return obj;
            }, {} );
        return Object.assign({
            person: null,
            filter: null,
            lang: 'english'
        }, obj );
    },
    write: function () {
        window.location.hash = Object.keys( state )
            .filter( function ( key ) {
                return state[ key ];
            })
            .map( function ( key ) {
                return key + '=' + state[ key ];
            }).join( '&' );
    }
}

var state = hash.read();

var MISSING = 100;

var seed = 1;
function rand ( min, max ) {
    seed = seed * 16807 % 2147483647;
    return min + (( seed - 1 ) / 2147483646 ) * ( max - min );
}

function elementChildren ( element ) {
    return element.childNodes
        .filter( function ( node ) { return node.nodeType !== 3 } );
}

function createEmpty () {
    var li = document.createElement( 'li' );
    li.classList.add( 'list__item', 'list__item--missing' );
    li.style.width = rand( 50, 90 ) + '%';
    li.innerHTML = '&nbsp;';
    return li;
}

var container = document.querySelector( '.list' );
var names = elementChildren( container );
var filters = document.querySelectorAll( '.filter__value' );
var personWrap = document.querySelector( '.person__wrap' );
var person = document.querySelector( '.person' );

function applyFilter ( str ) {
    if ( str === 'all' ) str = null;
    if ( str === null ) {
        list.forEach( function ( li ) {
            li.style.display = 'block';
        });
        filters.forEach( function ( el ) {
            el.classList.toggle( 'filter__value--active', el.dataset.filter === 'all' );
        })
    } else {
        var parts = str.split(':')
        var filter = parts[ 0 ];
        var value = parts[ 1 ];
        list.forEach( function ( li ) {
            li.style.display = li.dataset[ filter ] === value ? 'block' : 'none';
        });
        filters.forEach( function ( el ) {
            var active = el.dataset.filter === filter + ':' + value;
            el.classList.toggle( 'filter__value--active', active );
        });
    }
    state.filter = str;
    hash.write();
}

function applyLanguage ( language ) {
    document.body.className = 'lang_' + language;
    state.lang = language;
    hash.write();
}

function loadPerson ( slug ) {
    if ( slug === null ) {
        personWrap.classList.add( 'person__wrap--hidden' );
    } else {
        fetch( '/people/' + slug )
            .then( function ( r ) { return r.text() } )
            .then( function ( html ) {
                personWrap.scrollTop = 0;
                person.innerHTML = html;
                personWrap.classList.remove( 'person__wrap--hidden' );
            })
    }
    state.person = slug;
    hash.write();
}

var list = [], i;
for ( i = 0; i < MISSING; i++ ) list.push( true );
for ( i = 0; i < names.length; i++ ) list.splice( rand( 0, list.length ), 0, false );
var filled = 0;
list = list.map( function ( isEmpty ) {
    return isEmpty ? createEmpty() : names[ filled++ ];
})
list.forEach( function ( element ) { container.appendChild( element ) } )

filters.forEach( function ( element ) {
    element.addEventListener( 'click', function () {
        applyFilter( element.dataset.filter, element.dataset.filterValue );
    });
});

names.forEach( function ( element ) {
    element.addEventListener( 'click', function ( e ) {
        e.preventDefault();
        loadPerson( element.dataset.slug );
    })
})

personWrap.addEventListener( 'click', function ( e ) {
    if ( e.target === personWrap ) loadPerson( null );
})

document.querySelectorAll( '.lang__select' ).forEach( function ( element ) {
    element.addEventListener( 'click', function () {
        applyLanguage( element.dataset.lang );
    })
})

applyFilter( state.filter );
applyLanguage( state.lang );
loadPerson( state.person );