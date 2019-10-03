import React, { useState, useEffect, createRef } from 'react'
import { InstantSearch, Index, Hits, connectStateResults } from 'react-instantsearch-dom'
import algoliasearch from 'algoliasearch/lite'

import { Root, HitsWrapper, PoweredBy } from './styles'
import Input from './Input'
import * as hitComps from './hitComps'

const Results = connectStateResults(({ searchState: state, searchResults: res, children }: any) => {
  return res && res.nbHits > 0 ? children : `No results for '${state.query}'`
})

const Stats = connectStateResults(({ searchResults: res }) => {
  return <>{res && res.nbHits > 0 && `${res.nbHits} result${res.nbHits > 1 ? `s` : ``}`}</>
})

const useClickOutside = (ref: any, handler: any, events?: any) => {
  if (!events) events = [`mousedown`, `touchstart`]
  const detectClickOutside = (event: any) => !ref.current.contains(event.target) && handler()
  useEffect(() => {
    for (const event of events) document.addEventListener(event, detectClickOutside)
    return () => {
      for (const event of events) document.removeEventListener(event, detectClickOutside)
    }
  })
}

export default function Search({ indices, collapse }: any) {
  const ref = createRef()
  const [query, setQuery] = useState(``)
  const [focus, setFocus] = useState(false)
  const searchClient = algoliasearch(
    process.env.GATSBY_ALGOLIA_APP_ID as string,
    process.env.GATSBY_ALGOLIA_SEARCH_KEY as string
  )
  useClickOutside(ref, () => setFocus(false))
  return (
    <InstantSearch
      searchClient={searchClient}
      indexName={indices[0].name}
      onSearchStateChange={({ query }) => setQuery(query)}
      root={{ Root, props: { ref } }}
    >
      <Input onFocus={() => setFocus(true)} {...{ collapse, focus }} />
      {query.length > 0 && focus && (
        <HitsWrapper show={true}>
          {indices.map(({ name, title, hitComp }: { name: string; title: string; hitComp: any }) => (
            <Index key={name} indexName={name}>
              <header>
                <h3>{title}</h3>
                <Stats />
              </header>
              <Results>
                {/*
  // @ts-ignore */}
                <Hits hitComponent={hitComps[hitComp]} />
              </Results>
            </Index>
          ))}
          <PoweredBy />
        </HitsWrapper>
      )}
    </InstantSearch>
  )
}
