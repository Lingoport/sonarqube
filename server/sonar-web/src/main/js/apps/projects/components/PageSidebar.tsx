/*
 * SonarQube
 * Copyright (C) 2009-2019 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
import * as React from 'react';
import { flatMap } from 'lodash';
import FavoriteFilterContainer from './FavoriteFilterContainer';
import ClearAll from './ClearAll';
import LanguagesFilterContainer from '../filters/LanguagesFilterContainer';
import QualityGateFilter from '../filters/QualityGateFilter';
import TagsFilter from '../filters/TagsFilter';
import { translate } from '../../../helpers/l10n';
import { RawQuery } from '../../../helpers/query';
import { Facets } from '../types';
import { hasFilterParams } from '../query';

interface Props {
  facets?: Facets;
  onClearAll: () => void;
  onQueryChange: (change: RawQuery) => void;
  organization?: { key: string };
  query: RawQuery;
  showFavoriteFilter: boolean;
  view: string;
  visualization: string;
}

export default function PageSidebar(props: Props) {
  const { facets, onQueryChange, query, organization, view, visualization } = props;
  const isFiltered = hasFilterParams(query);
  const maxFacetValue = getMaxFacetValue(facets);
  const facetProps = { onQueryChange, maxFacetValue, organization, query };

  let linkQuery: RawQuery | undefined = undefined;
  if (view !== 'overall') {
    linkQuery = { view };

    if (view === 'visualizations') {
      linkQuery.visualization = visualization;
    }
  }

  return (
    <div>

        <FavoriteFilterContainer organization={organization} query={linkQuery} />

      <div className="projects-facets-header clearfix">
        {isFiltered && <ClearAll onClearAll={props.onClearAll} />}

        <h3>{translate('filters')}</h3>
      </div>
      <QualityGateFilter {...facetProps} facet={getFacet(facets, 'gate')} value={query.gate} />


      <LanguagesFilterContainer
        {...facetProps}
        facet={getFacet(facets, 'languages')}
        value={query.languages}
      />
      <TagsFilter {...facetProps} facet={getFacet(facets, 'tags')} value={query.tags} />
    </div>
  );
}

function getFacet(facets: Facets | undefined, name: string) {
  return facets && facets[name];
}

function getMaxFacetValue(facets?: Facets) {
  return facets && Math.max(...flatMap(Object.values(facets), facet => Object.values(facet)));
}
