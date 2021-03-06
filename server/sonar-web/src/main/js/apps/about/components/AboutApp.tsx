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
import { connect } from 'react-redux';
import { keyBy } from 'lodash';
import { Link } from 'react-router';
import { Location } from 'history';
import AboutProjects from './AboutProjects';
import EntryIssueTypes from './EntryIssueTypes';
import A11ySkipTarget from '../../../app/components/a11y/A11ySkipTarget';
import GlobalContainer from '../../../app/components/GlobalContainer';
import { searchProjects } from '../../../api/components';
import { getFacet } from '../../../api/issues';
import { fetchAboutPageSettings } from '../actions';
import {
  getAppState,
  getCurrentUser,
  getGlobalSettingValue,
  Store
} from '../../../store/rootReducer';
import { translate } from '../../../helpers/l10n';
import { addWhitePageClass, removeWhitePageClass } from '../../../helpers/pages';
import '../styles.css';

interface Props {
  appState: Pick<T.AppState, 'defaultOrganization' | 'organizationsEnabled'>;
  currentUser: T.CurrentUser;
  customText?: string;
  fetchAboutPageSettings: () => Promise<void>;
  location: Location;
}

interface State {
  issueTypes?: T.Dict<{ count: number }>;
  loading: boolean;
  projectsCount: number;
}

export class AboutApp extends React.PureComponent<Props, State> {
  mounted = false;

  state: State = {
    loading: true,
    projectsCount: 0
  };

  componentDidMount() {
    this.mounted = true;
    this.loadData();
    addWhitePageClass();
  }

  componentWillUnmount() {
    this.mounted = false;
    removeWhitePageClass();
  }

  loadProjects() {
    return searchProjects({ ps: 1 }).then(r => r.paging.total);
  }

  loadIssues() {
    return getFacet({ resolved: false }, 'types');
  }

  loadCustomText() {
    return this.props.fetchAboutPageSettings();
  }

  loadData() {
    Promise.all([this.loadProjects(), this.loadIssues(), this.loadCustomText()]).then(
        responses => {
          if (this.mounted) {
            const [projectsCount, issues] = responses;
            const issueTypes = keyBy(issues.facet, 'val');
            this.setState({ projectsCount, issueTypes, loading: false });
          }
        },
        () => {
          if (this.mounted) {
            this.setState({ loading: false });
          }
        }
    );
  }

  render() {
    const { customText } = this.props;
    const { loading, issueTypes, projectsCount } = this.state;

    let bugs;
    let vulnerabilities;
    let codeSmells;
    if (!loading && issueTypes) {
      bugs = issueTypes['BUG'] && issueTypes['BUG'].count;
      vulnerabilities = issueTypes['VULNERABILITY'] && issueTypes['VULNERABILITY'].count;
      codeSmells = issueTypes['CODE_SMELL'] && issueTypes['CODE_SMELL'].count;
    }

    return (
        <GlobalContainer location={this.props.location}>
          <div className="page page-limited about-page" id="about-page">
            <A11ySkipTarget anchor="about_main" />

            <div className="about-page-entry">
              <div className="about-page-intro">
                <img src="../../../images/lingoport/lingoport_logo.png" width="197" height="50"/>
                <h1 className="big-spacer-bottom">{translate('layout.sonar.slogan')}</h1>
                {!this.props.currentUser.isLoggedIn && (
                    <Link className="button button-active big-spacer-right" to="/sessions/new">
                      {translate('layout.login')}
                    </Link>
                )}
                <a
                    className="button"
                    href="https://wiki.lingoport.com/About_Dashboard"
                    rel="noopener noreferrer"
                    target="_blank">
                  {translate('about_page.read_documentation')}
                </a>
              </div>

              <div className="about-page-instance">
                <AboutProjects count={projectsCount} loading={loading} />
                <EntryIssueTypes
                    bugs={bugs}
                    codeSmells={codeSmells}
                    loading={loading}
                    vulnerabilities={vulnerabilities}
                />
              </div>
            </div>


          {customText && (
            <div className="about-page-section" dangerouslySetInnerHTML={{ __html: customText }} />
          )}
         <div>
           <div className="flex-columns">
               <h3> Welcome to the new Lingoport Dashboard. </h3>
               <br/>
              <h5>   Based on customer feedback, we have improved the navigation features and optimized the ease of use.  While the information is largely unchanged, this new layout should be more intuitive, easier to navigate, and more quickly communicate the most relevant information to key stakeholders.
                  <br/>
                  Plus, we have added the gremlin icons to help quickly identify the most common i18n issues. Finally, the dashboard foundation is SonarQube 7.8, so it supports security plugins such as SAML and LDAP.</h5>
           </div>
         </div>
          </div>


        </GlobalContainer>
    );
  }
}

const mapStateToProps = (state: Store) => {
  const customText = getGlobalSettingValue(state, 'sonar.lf.aboutText');
  return {
    appState: getAppState(state),
    currentUser: getCurrentUser(state),
    customText: customText && customText.value
  };
};

const mapDispatchToProps = { fetchAboutPageSettings } as any;

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AboutApp);
