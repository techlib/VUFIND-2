<?php
/**
 * Holdings (ILS) tab
 *
 * PHP version 5
 *
 * Copyright (C) Villanova University 2010.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 2,
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
 *
 * @category VuFind2
 * @package  RecordTabs
 * @author   Demian Katz <demian.katz@villanova.edu>
 * @license  http://opensource.org/licenses/gpl-2.0.php GNU General Public License
 * @link     http://vufind.org/wiki/vufind2:record_tabs Wiki
 */
namespace VuFind\RecordTab;

/**
 * Holdings (ILS) tab
 *
 * @category VuFind2
 * @package  RecordTabs
 * @author   Demian Katz <demian.katz@villanova.edu>
 * @license  http://opensource.org/licenses/gpl-2.0.php GNU General Public License
 * @link     http://vufind.org/wiki/vufind2:record_tabs Wiki
 */
class HoldingsILS extends AbstractBase
{
    /**
     * ILS connection (or false if not applicable)
     *
     * @param \VuFind\ILS\Connection|bool
     */
    protected $catalog;

    /**
     * Constructor
     *
     * @param \VuFind\ILS\Connection|bool $catalog ILS connection to use to check
     * for holdings before displaying the tab; set to false if no check is needed
     */
    public function __construct($catalog)
    {
        $this->catalog = ($catalog && $catalog instanceof \VuFind\ILS\Connection)
            ? $catalog : false;
    }

    /**
     * Get the on-screen description for this tab.
     *
     * @return string
     */
    public function getDescription()
    {
        return 'Holdings';
    }

    /**
     * Support method used by template -- extract all unique call numbers from
     * an array of items.
     *
     * @param array $items Items to search through.
     *
     * @return array
     */
    public function getUniqueCallNumbers($items)
    {
        $callNos = array();
        foreach ($items as $item) {
            if (isset($item['callnumber']) && strlen($item['callnumber']) > 0) {
                $callNos[] = $item['callnumber'];
            }
        }
        sort($callNos);
        return array_unique($callNos);
    }

    /**
     * Is this tab active?
     *
     * @return bool
     */
    public function isActive()
    {
        if ($this->catalog) {
            return $this->catalog->hasHoldings($this->driver->getUniqueID());
        }
        return true;
    }

    /*
     * Support functions for holding filters
     * Daniel Marecek, NTK
     *
     */
    public function getFilters()
    {
	if (!isset($this->filters)) {
		$this->filters = $this->driver->getHoldingFilters();
	}
	return $this->filters;
    }

    public function getSelectedFilters()
    {
	$filters = array();
	foreach ($this->getAvailableFilters() as $name => $type) {
		$filterValue = $this->getRequest()->getQuery($name);
		if ($filterValue != null || !empty($filterValue)) {
			$filters[$name] = $filterValue;
		}
	}
	return $filters;
    }

    public function getAvailableFilters()
    {
	if (!isset($this->availableFilters)) {
		$this->availableFilters = $this->driver->getAvailableHoldingFilters();
	}
	return $this->availableFilters;
    }

    public function getRealTimeHoldings()
    {
	return $this->driver->getRealTimeHoldings($this->getSelectedFilters());
    }

    public function asHiddenFields($field)
    {
	$allFilters = $this->getAvailableFilters();
	$filtersToKeep = isset($allFilters[$field]['keep']) ? $allFilters[$field]['keep'] : array();
	$selectedFilters = $this->getSelectedFilters();
	$result = '';
	foreach ($filtersToKeep as $filterToKeep) {
		if (isset($selectedFilters[$filterToKeep])) {
			$value = $selectedFilters[$filterToKeep];
			$result .= '<input type="hidden" name="' .
				htmlspecialchars($filterToKeep) . '" value="' .
				htmlspecialchars($value) . '" />';
		}
	}
	return $result;
    }
}
