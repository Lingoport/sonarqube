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
import { AutoSizer } from 'react-virtualized/dist/commonjs/AutoSizer';
import { List, ListRowProps } from 'react-virtualized/dist/commonjs/List';
import { WindowScroller } from 'react-virtualized/dist/commonjs/WindowScroller';
import ProjectCard from './ProjectCard';
import NoFavoriteProjects from './NoFavoriteProjects';
import EmptyInstance from './EmptyInstance';
import EmptyFavoriteSearch from './EmptyFavoriteSearch';
import EmptySearch from '../../../components/common/EmptySearch';
import { Project } from '../types';
import { Query } from '../query';
import { OnboardingContext } from '../../../app/components/OnboardingContext';
import {getJSON} from "../../../helpers/request";

interface Props {
  cardType?: string;
  currentUser: T.CurrentUser;
  isFavorite: boolean;
  isFiltered: boolean;
  organization: T.Organization | undefined;
  projects: Project[];
  query: Query;
  data: any;
}

export default class ProjectsList extends React.PureComponent<Props> {

  state = {
    lrmdata:[]
  }

  componentWillMount() {
   // this.getgz(this.props.projects);
    this.getgz(this.props.projects).then(
        (valuesReturnedByAPI) => {
          this.setState({
            lrmdata: valuesReturnedByAPI
          });
        }
    );
  }

  getCardHeight = () => {
    return this.props.cardType === 'leak' ? 159 : 143;
  };


  findgzissues(project: Project) {
    return getJSON('/api/measures/search_history', {
      component: project.key,
      metrics: "lngprt-gyzr-violations,lngprt-gyzr-violations-rci,lngprt-lrm-status-avg-completion-percent,reliability_remediation_effort",
      ps: 1000
    }).then(function (responseMetrics) {
      let result = {
        issues: "-",
        rci: "-",
        comp: "-",
        rem: "-"
      };
      const numberOfMeasuresRetrieved = 4;
      for (let k = 0; k < numberOfMeasuresRetrieved; k++) {
        for (let d = 0; d < responseMetrics.measures[k].history.length; d++) {
          if (responseMetrics.measures[k].metric === "lngprt-gyzr-violations") {
            result.issues = responseMetrics.measures[k].history[d].value;
            if(result.issues===undefined||result.issues.length<1)
              result.issues = '-';
          } else if (responseMetrics.measures[k].metric === "lngprt-gyzr-violations-rci") {
            result.rci = responseMetrics.measures[k].history[d].value;
            if(result.rci===undefined||result.rci.length<1)
              result.rci = '-';
          } else if (responseMetrics.measures[k].metric === "lngprt-lrm-status-avg-completion-percent") {
            result.comp = responseMetrics.measures[k].history[d].value;
          } else if (responseMetrics.measures[k].metric === "reliability_remediation_effort") {
            result.rem = responseMetrics.measures[k].history[d].value;
          }
        }
      }
      return result;
    });
  }

  getgz = async(projects: Project[]|undefined) =>{
    var gzdata =[];
    if(projects===undefined)
      return null;
    for (let i = 0; i < projects.length; i++){
      gzdata[i]  = await this.findgzissues(projects[i]);
    }
   // await this.setState({lrmdata: gzdata})
    return gzdata;
  }


  renderNoProjects() {
    const { currentUser, isFavorite, isFiltered, organization, query } = this.props;
    if (isFiltered) {
      return isFavorite ? <EmptyFavoriteSearch query={query} /> : <EmptySearch />;
    }
    return isFavorite ? (
      <OnboardingContext.Consumer>
        {openProjectOnboarding => (
          <NoFavoriteProjects openProjectOnboarding={openProjectOnboarding} />
        )}
      </OnboardingContext.Consumer>
    ) : (
      <OnboardingContext.Consumer>
        {openProjectOnboarding => (
          <EmptyInstance
            currentUser={currentUser}
            openProjectOnboarding={openProjectOnboarding}
            organization={organization}
          />
        )}
      </OnboardingContext.Consumer>
    );
  }

  renderRow = ({ index, key, style }: ListRowProps) => {
    const project = this.props.projects[index];
    const height = this.getCardHeight();
    let lrm = null;
    if(this.state.lrmdata!=undefined)
       lrm = this.state.lrmdata[index];
    return (
      <div key={key} style={{ ...style, height }}>
        <ProjectCard
          height={height}
          key={project.key}
          organization={this.props.organization}
          project={project}
          lrm = {lrm}
          type={this.props.cardType}
        />
      </div>
    );
  };

  renderList() {
    const cardHeight = this.getCardHeight();
    return (
      <WindowScroller>
        {({ height, isScrolling, onChildScroll, scrollTop }) => (
          <AutoSizer disableHeight={true}>
            {({ width }) => (
              <div>
                <List
                  autoHeight={true}
                  height={height}
                  isScrolling={isScrolling}
                  onScroll={onChildScroll}
                  overscanRowCount={2}
                  rowCount={this.props.projects.length}
                  rowHeight={cardHeight + 20}
                  rowRenderer={this.renderRow}
                  scrollTop={scrollTop}
                  style={{ outline: 'none' }}
                  width={width}
                />
              </div>
            )}
          </AutoSizer>
        )}
      </WindowScroller>
    );
  }


  render() {
    const { projects } = this.props;

    return (
      <div className="projects-list">
        {projects.length > 0 ? this.renderList() : this.renderNoProjects()}
      </div>
    );
  }
}
