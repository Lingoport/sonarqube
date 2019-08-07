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
import {Project} from "../types";
import {findScans} from "../utils";

interface Props {
  measures: Project;
}

export default function ProjectCardOverallMeasures({ measures }: Props) {
  if (measures === undefined) {
    return null;
  }

 // const { ncloc } = measures;

  return (
    <div className="project-card-measures">
      <div className="project-card-measure" data-key="reliability_rating">
        <div className="project-card-measure-inner">
          <div className="project-card-measure-number">
            <span className="spacer-right">
              {findScans(measures)}
            </span>
          </div>
          <div className="project-card-measure-label-with-icon">
            GLOBALYZER ISSUES
          </div>
        </div>
      </div>

      <div className="project-card-measure" data-key="security_rating">
        <div className="project-card-measure-inner">
          <div className="project-card-measure-number">
            <span className="spacer-right">
              '-'
            </span>
          </div>
          <div className="project-card-measure-label-with-icon">
            GLOBALYZER RCI
          </div>
        </div>
      </div>

      <div className="project-card-measure" data-key="sqale_rating">
        <div className="project-card-measure-inner">
          <div className="project-card-measure-number">
             <span className="spacer-right">
              '-'
            </span>
          </div>
          <div className="project-card-measure-label-with-icon">
            LRM AVG COMPLETE
          </div>
        </div>
      </div>

      <div className="project-card-measure" data-key="coverage">
        <div className="project-card-measure-inner">
          <div className="project-card-measure-number">
            <span className="spacer-right">
              '-'
            </span>
          </div>
          <div className="project-card-measure-label">REMEDIATION</div>
        </div>
      </div>

    </div>
  );
}
