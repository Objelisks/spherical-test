import '@testing-library/preact'

// todo: configure jsdom

import {expect, test } from 'vitest'
import {render} from '@testing-library/preact'
import { Map } from './Map'

test('shows the map on the page', () => {
  const {getByText} = render(<Map></Map>)
  expect(getByText('lng')).not.toBeNull()
  expect(getByText('lat')).not.toBeNull()
  expect(getByText('zoom')).not.toBeNull()
})